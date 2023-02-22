import 'dart:convert';

import "package:chewie/chewie.dart";
import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:logging/logging.dart";
import "package:media_extension/media_extension_action_types.dart";
import "package:photo_view/photo_view.dart";
import "package:photos/services/app_lifecycle_service.dart";

import "package:video_player/video_player.dart";

class FileViewer extends StatefulWidget {
  const FileViewer({super.key});

  @override
  State<StatefulWidget> createState() {
    return FileViewerState();
  }
}

class FileViewerState extends State<FileViewer> {
  final action = AppLifecycleService.instance.mediaExtensionAction;
  ChewieController? controller;
  VideoPlayerController? videoController;
  final Logger _logger = Logger("FileViewer");

  @override
  void initState() {
    super.initState();
    if (action.type == MediaType.video) {
      initController();
    }
  }

  @override
  void dispose() {
    videoController?.dispose();
    controller?.dispose();
    super.dispose();
  }

  void initController() async {
    videoController = VideoPlayerController.contentUri(
      Uri.parse(action.data!),
    );
    controller = ChewieController(
      videoPlayerController: videoController!,
      autoInitialize: true,
      aspectRatio: 16 / 9,
      autoPlay: true,
      looping: true,
      showOptions: false,
      materialProgressColors: ChewieProgressColors(
        playedColor: const Color.fromRGBO(45, 194, 98, 1.0),
        handleColor: Colors.white,
        bufferedColor: Colors.white,
      ),
    );
    controller!.addListener(() {
      if (!controller!.isFullScreen) {
        SystemChrome.setPreferredOrientations(
          [DeviceOrientation.portraitUp],
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          onPressed: () {
            SystemChannels.platform.invokeMethod('SystemNavigator.pop');
          },
          icon: const Icon(Icons.arrow_back),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: Center(
              child: (() {
                if (action.type == MediaType.image) {
                  return PhotoView(
                    imageProvider: MemoryImage(base64Decode(action.data!)),
                  );
                } else if (action.type == MediaType.video) {
                  return controller != null
                      ? Chewie(controller: controller!)
                      : const CircularProgressIndicator();
                } else {
                  _logger.severe('unsupported file type ${action.type}');
                  return const Icon(Icons.error);
                }
              })(),
            ),
          ),
        ],
      ),
    );
  }
}
